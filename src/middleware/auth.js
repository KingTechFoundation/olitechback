const { supabase } = require("../config/supabase");

// Performance optimization: Cache authenticated users to avoid hitting Supabase API on every single request
const sessionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, error: "Unauthorized", code: 401 });
    }

    // 1. Check local cache for basic auth (userData)
    let userData = null;
    const cached = sessionCache.get(token);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      userData = cached.userData;
    } else {
      // 2. Not in cache or expired -> Verify with Supabase Auth
      const { data: authData, error: userErr } = await supabase.auth.getUser(token);
      if (userErr || !authData?.user) {
        console.error(`[Auth] Token validation failed:`, userErr?.message);
        return res.status(401).json({ success: false, error: "Invalid token", code: 401 });
      }
      userData = authData.user;
      // Update cache for Auth part only
      sessionCache.set(token, { userData, timestamp: Date.now() });
    }

    // 3. ALWAYS fetch profile from DB in real-time
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, full_name, role, is_active, is_blocked, force_logout_at")
      .eq("id", userData.id)
      .single();

    if (profileErr || !profile || !profile.is_active) {
      return res.status(403).json({ success: false, error: "User inactive or missing profile", code: 403 });
    }

    // 4. Check for Blocked status
    if (profile.is_blocked) {
      sessionCache.delete(token);
      return res.status(403).json({ success: false, error: "Contact OlitechHub admin for Assistance", code: 403, blocked: true });
    }

    // 5. Check for Force Logout (Token Revocation)
    if (profile.force_logout_at) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
        
        // Issued At (iat) is in seconds, convert to milliseconds
        const issuedAtMs = payload.iat * 1000;
        const revokedAtMs = new Date(profile.force_logout_at).getTime();

        // If the token was issued BEFORE the last forced logout, it is invalid
        // We add a 1-second grace buffer for clock skew
        if (issuedAtMs < revokedAtMs - 1000) {
          console.warn(`[Auth] Rejecting revoked token for ${profile.full_name}. Issued: ${new Date(issuedAtMs).toISOString()}, Revoked: ${new Date(revokedAtMs).toISOString()}`);
          sessionCache.delete(token);
          return res.status(401).json({ success: false, error: "Session expired. Please login again.", code: 401 });
        }
      } catch (e) {
        console.error("[Auth] JWT decode error:", e);
      }
    }

    // Update last seen (fire and forget)
    supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", profile.id).then(()=>{});

    const userPayload = {
      id: userData.id,
      email: userData.email,
      username: userData.user_metadata?.username || userData.email,
      role: profile.role,
      full_name: profile.full_name,
      token,
    };

    // 4. Update cache
    sessionCache.set(token, { userData, timestamp: Date.now() });
    
    // Periodically clean up old cache entries
    if (sessionCache.size > 1000) {
      const now = Date.now();
      for (const [key, value] of sessionCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) sessionCache.delete(key);
      }
    }

    req.user = userPayload;
    next();
  } catch (error) {
    // Handle Supabase/Networking timeout specifically
    if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.message?.includes('timeout')) {
      return res.status(503).json({ 
        success: false, 
        error: "Security validation timeout (Supabase). Please try again in a moment.", 
        code: 503 
      });
    }
    next(error);
  }
};

module.exports = authMiddleware;

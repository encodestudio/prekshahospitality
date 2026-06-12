from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """Session auth without DRF's CSRF enforcement.

    CSRF is handled at the CORS + SameSite cookie level instead.
    The API is only reachable from CORS_ALLOWED_ORIGINS, and the session
    cookie has SameSite=Lax, so cross-site attacks are already blocked.
    """

    def enforce_csrf(self, request):
        pass

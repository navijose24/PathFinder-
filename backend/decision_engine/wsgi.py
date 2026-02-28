"""
WSGI config for decision_engine project.

This exposes the WSGI callable as a module-level variable named ``application``.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "decision_engine.settings")

application = get_wsgi_application()


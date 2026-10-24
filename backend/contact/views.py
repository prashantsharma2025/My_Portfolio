
import json

from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import render

from .models import ContactMessage


@ensure_csrf_cookie
def portfolio_page(request):
    return render(request, "index.html")


@require_POST
@csrf_protect
def submit_contact(request):
    if request.content_type != "application/json":
        return JsonResponse(
            {"success": False, "message": "Invalid request format."},
            status=400,
        )

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {"success": False, "message": "Invalid form data."},
            status=400,
        )

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    subject = str(data.get("subject", "")).strip()
    message = str(data.get("message", "")).strip()

    if not all([name, email, message]):
        return JsonResponse(
            {"success": False, "message": "Please fill in all required fields."},
            status=400,
        )

    if len(name) > 100 or len(email) > 254:
        return JsonResponse(
            {"success": False, "message": "Name or email is too long."},
            status=400,
        )

    if len(subject) > 150 or len(message) > 5000:
        return JsonResponse(
            {"success": False, "message": "Subject or message is too long."},
            status=400,
        )

    from django.core.validators import validate_email
    from django.core.exceptions import ValidationError

    try:
        validate_email(email)
    except ValidationError:
        return JsonResponse(
            {"success": False, "message": "Please enter a valid email address."},
            status=400,
        )

    ContactMessage.objects.create(
        name=name,
        email=email,
        subject=subject,
        message=message,
    )

    return JsonResponse({
        "success": True,
        "message": "Thank you! Your message has been sent successfully.",
    })

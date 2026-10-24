
from django.urls import path
from . import views

urlpatterns = [
    path("", views.portfolio_page, name="portfolio"),
    path("api/contact/", views.submit_contact, name="submit_contact"),
]

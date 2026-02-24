import os
from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["billing"])

@router.get('/billing/plans')
def plans():
    return {
        "plans": [
            {"id": "core", "name": "Core", "price_monthly": 0, "features": ["Official court roster", "Local rules/holidays", "Last reviewed timestamps"]},
            {"id": "pro", "name": "Pro", "price_monthly": 99, "features": ["Advanced filters", "County political+demographic briefs", "Exports"]},
            {"id": "premium", "name": "Premium", "price_monthly": 299, "features": ["Carrier report builder", "Supplemental context layer", "Priority updates"]}
        ]
    }

@router.get('/billing/checkout-links')
def checkout_links():
    return {
        "pro": os.getenv("PAYMENT_LINK_PRO", ""),
        "premium": os.getenv("PAYMENT_LINK_PREMIUM", ""),
        "notes": "Set PAYMENT_LINK_PRO and PAYMENT_LINK_PREMIUM to Stripe Payment Links (or provider equivalent)."
    }

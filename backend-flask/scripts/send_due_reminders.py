#!/usr/bin/env python3
"""Simple script to send due reminders and mark them sent.

This script prints reminders and marks them as sent. Integrate with scheduler (cron/Task Scheduler).
"""
import os
from app import create_app
from app.services.supabase_service import supabase_service


def main():
    app = create_app()
    with app.app_context():
        due = supabase_service.get_due_reminders()
        print(f"Found {len(due)} due reminders")
        for r in due:
            try:
                # For now just print; extend to send email/SMS via email_service/sms_service
                print('Sending reminder:', r.get('id'), r.get('title'), r.get('scheduled_at'))
                supabase_service.mark_reminder_sent(r.get('id'))
            except Exception as e:
                print('Failed sending reminder', r.get('id'), e)


if __name__ == '__main__':
    main()

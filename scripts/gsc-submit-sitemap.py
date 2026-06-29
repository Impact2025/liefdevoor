#!/usr/bin/env python3
"""Submit sitemap to Google Search Console using service account."""
import json, os
from pathlib import Path

# Load service account from .env.local
env_file = Path(__file__).parent.parent / '.env.local'
env = env_file.read_text()
for line in env.split('\n'):
    if 'GOOGLE_SERVICE_ACCOUNT_JSON' in line and '{' in line:
        raw = line.split('=', 1)[1].strip()
        sa = json.loads(raw)
        break

from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/webmasters']
SITE_URL = 'sc-domain:liefdevooriedereen.nl'
SITEMAP_URL = 'https://www.liefdevooriedereen.nl/sitemap.xml'

creds = service_account.Credentials.from_service_account_info(sa, scopes=SCOPES)
service = build('searchconsole', 'v1', credentials=creds, cache_discovery=False)

# Submit
try:
    service.sitemaps().submit(siteUrl=SITE_URL, feedpath=SITEMAP_URL).execute()
    print('✅ Sitemap submitted to GSC')
except Exception as e:
    print(f'Sitemap submit result: {e}')

# List
try:
    sms = service.sitemaps().list(siteUrl=SITE_URL).execute()
    for s in sms.get('sitemap', []):
        c = s.get('contents', [{}])
        print(f'  {s["path"]}: {c[0].get("submitted",0) if c else 0} submitted, {c[0].get("indexed",0) if c else 0} indexed')
except Exception as e:
    print(f'List: {e}')

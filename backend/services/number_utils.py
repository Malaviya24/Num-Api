import re

def normalize_mobile(number_str: str) -> str:
    if not number_str:
        return ""
    # Remove all whitespace, dashes, and parentheses
    s = str(number_str).strip()
    s = re.sub(r'[\s\-()]+', '', s)
    
    # Remove +91 or 91 or 0 prefix
    if s.startswith('+91'):
        s = s[3:]
    elif s.startswith('91') and len(s) == 12:
        s = s[2:]
    elif s.startswith('0') and len(s) == 11:
        s = s[1:]
    
    # Keep only digits
    s = re.sub(r'\D', '', s)
    
    # Generally mobile numbers in India are 10 digits
    return s[-10:] if len(s) >= 10 else s

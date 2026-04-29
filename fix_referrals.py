import re
file_path = r"c:\Users\harih\OneDrive\Desktop\secure_Internship_management_portal-main\code.gs"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Normalize the processWithdrawal logic
# Match: if (String(data[i][idCol]) === String(referrerId)) {
# Replace: if (String(data[i][idCol]).trim().toUpperCase() === String(referrerId).trim().toUpperCase()) {
new_content = re.sub(
    r"if \(String\(data\[i\]\[idCol\]\) === String\(referrerId\)\) {",
    "if (String(data[i][idCol]).trim().toUpperCase() === String(referrerId).trim().toUpperCase()) {",
    content
)

# Match: if (String(data[i][referrerCol]) === String(referrerId)) {
new_content = re.sub(
    r"if \(String\(data\[i\]\[referrerCol\]\) === String\(referrerId\)\) {",
    "if (String(data[i][referrerCol]).trim().toUpperCase() === String(referrerId).trim().toUpperCase()) {",
    new_content
)

# Add .trim().toLowerCase() to verified checks
new_content = re.sub(
    r"referrerVerified = \(String\(data\[i\]\[payStatusCol\]\) === 'verified'\);",
    "referrerVerified = (String(data[i][payStatusCol]).trim().toLowerCase() === 'verified');",
    new_content
)
new_content = re.sub(
    r"var refereeVerified = \(String\(data\[i\]\[payStatusCol\]\) === 'verified'\);",
    "var refereeVerified = (String(data[i][payStatusCol]).trim().toLowerCase() === 'verified');",
    new_content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

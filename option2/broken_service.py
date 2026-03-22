from datetime import datetime

def get_contacts_to_reach_out(contacts):
	result = []

	for contact in contacts:
		days = datetime.now() - contact["last_contacted"]
		
		if days > 30:
			result.append(contact)
	
	return result
# Simple HighLevel Integration Guide
## For Name, Email, Phone Only - Using Private Integration

This is a minimal guide for integrating HighLevel contact creation into any project using Private Integration tokens.

---

## Step 1: Get Your HighLevel Credentials

### A. Create Private Integration
1. Login to HighLevel
2. Go to **Settings → Other Settings → Private Integrations**
3. Click **"Create new Integration"**
4. Fill in:
   - **Name:** Your Project Name (e.g., "My Website Form")
   - **Description:** Brief description (e.g., "Contact form integration")

### B. Select Permissions (Scopes)
Check these boxes:
- ✅ **contacts.write** (Required - to create contacts)
- ✅ **businesses.read** (Required - to access location)

### C. Save and Copy Credentials
1. Click **"Save"**
2. Copy your **Private Integration Token** (starts with `pit-`)
3. Go to **Settings → Business Profile** and copy your **Location ID**

---

## Step 2: Set Up Environment Variables

Create a `.env` file in your project root:

```bash
# HighLevel Private Integration
VITE_HIGHLEVEL_TOKEN=pit-your-token-here
VITE_HIGHLEVEL_LOCATION_ID=your-location-id-here
```

**Important Notes:**
- Use `VITE_` prefix if using Vite
- Use `REACT_APP_` prefix if using Create React App
- Use `NEXT_PUBLIC_` prefix if using Next.js
- For backend/Node.js, no prefix needed

---

## Step 3: Install Dependencies (if needed)

No special packages required! Just use native `fetch`.

---

## Step 4: Create the Integration Code

### Option A: Frontend (React/Vite)

Create `src/hooks/useHighLevel.js`:

```javascript
import { useState } from 'react';

export const useHighLevel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createContact = async ({ firstName, lastName, email, phone }) => {
    setLoading(true);
    setError(null);

    try {
      const token = import.meta.env.VITE_HIGHLEVEL_TOKEN;
      const locationId = import.meta.env.VITE_HIGHLEVEL_LOCATION_ID;

      if (!token || !locationId) {
        throw new Error('Missing HighLevel credentials');
      }

      const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName || '',
          name: `${firstName} ${lastName || ''}`.trim(),
          email: email,
          phone: phone || '',
          locationId: locationId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return { success: true, contact: result.contact || result };

    } catch (err) {
      const errorMessage = err.message || 'Failed to create contact';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { createContact, loading, error };
};
```

### Option B: Backend (Node.js/Express)

Create `server.js` or add to existing server:

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/contacts', async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    const token = process.env.HIGHLEVEL_TOKEN;
    const locationId = process.env.HIGHLEVEL_LOCATION_ID;

    if (!token || !locationId) {
      return res.status(500).json({ error: 'Missing HighLevel credentials' });
    }

    const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        firstName,
        lastName: lastName || '',
        name: `${firstName} ${lastName || ''}`.trim(),
        email,
        phone: phone || '',
        locationId
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.message || 'Failed to create contact'
      });
    }

    const result = await response.json();
    res.json({ success: true, contact: result.contact || result });

  } catch (error) {
    console.error('HighLevel Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
```

---

## Step 5: Use in Your Form

### React Example:

```javascript
import { useState } from 'react';
import { useHighLevel } from './hooks/useHighLevel';

function ContactForm() {
  const { createContact, loading, error } = useHighLevel();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await createContact(formData);
      alert('Contact created successfully!');
      setFormData({ firstName: '', lastName: '', email: '', phone: '' });
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="First Name"
        value={formData.firstName}
        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <input
        type="tel"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
      
      {error && <p style={{color: 'red'}}>{error}</p>}
    </form>
  );
}
```

---

## Step 6: Test It

1. **Start your dev server**
2. **Fill out the form** with test data
3. **Submit**
4. **Check HighLevel** → Contacts to see the new contact

---

## Troubleshooting

### Error: "Missing HighLevel credentials"
- Check your `.env` file exists
- Verify variable names match (VITE_, REACT_APP_, etc.)
- Restart your dev server after adding `.env`

### Error: "401 Unauthorized"
- Token is incorrect or expired
- Regenerate token in HighLevel Private Integrations

### Error: "403 Forbidden"
- Missing required scopes (`contacts.write`, `businesses.read`)
- Recreate integration with correct permissions

### Error: "404 Not Found"
- Check endpoint has trailing slash: `/contacts/` not `/contacts`

### Contact created but missing data
- Check field names match exactly: `firstName`, `lastName`, `email`, `phone`
- Verify `locationId` is correct

---

## API Reference

### Endpoint
```
POST https://services.leadconnectorhq.com/contacts/
```

### Headers
```javascript
{
  'Authorization': 'Bearer pit-your-token-here',
  'Content-Type': 'application/json',
  'Version': '2021-07-28',
  'Accept': 'application/json'
}
```

### Minimum Required Body
```javascript
{
  "firstName": "John",
  "email": "john@example.com",
  "locationId": "your-location-id"
}
```

### Full Body (Recommended)
```javascript
{
  "firstName": "John",
  "lastName": "Doe",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "locationId": "your-location-id"
}
```

---

## Security Best Practices

1. **Never commit `.env` to git** - Add to `.gitignore`
2. **Use backend proxy for production** - Don't expose tokens in frontend
3. **Validate input** - Sanitize data before sending to API
4. **Handle errors gracefully** - Don't expose sensitive error details to users

---

## That's It!

You now have a working HighLevel integration for creating contacts with name, email, and phone. No OAuth, no complexity—just a simple Private Integration token and a fetch request.


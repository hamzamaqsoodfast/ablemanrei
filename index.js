const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/sendToMonday', async (req, res) => {
  const { 
    fullAddress, 
    propertyType, 
    state, 
    sellerName, 
    sellerPhone, 
    email, 
    closingTime, 
    askingPrice, 
    isNegotiable, 
    conditionNotes, 
    contactDate // New field for date
  } = req.body;

  const mondayToken = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQzMTQ5MDY2OCwiYWFpIjoxMSwidWlkIjo2NzgyNDc3MywiaWFkIjoiMjAyNC0xMS0wM1QxMDo0OToyMi4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTQ5NDQ5MTQsInJnbiI6InVzZTEifQ.M2y5qvKTBugSmKQLJnPFinl9o1h0H70yCAVnsM75p0M';
  const boardId = '7789594745';
  const groupId = 'topics';

  // Prepare column values, including the new date field
  const columnValues = JSON.stringify({
  "short_text": fullAddress || "",           // Full Address
  "short_text__1": propertyType,             // Type of Property
  "state__1": state || "",                   // State
  "short_text8": sellerName || "",           // Seller Name
  "number": (sellerPhone || "").toString(),  // Seller Phone as a string
  "email": {                                 // Email field
    "email": email || "",
    "text": email || ""
  },
  "number9": (closingTime || "").toString(), // Closing Time as a string
  "number0": (askingPrice || "").toString(), // Asking Price as a string
  "single_select7": isNegotiable || "",      // Is it negotiable?
  "long_text": conditionNotes || "",         // Condition/Notes
  "date": {                                  // Date column for "When would you like us to contact you?"
    "date": new Date(contactDate).toISOString().split('T')[0]
  }
});


  const query = `
    mutation ($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
      create_item (
        board_id: $boardId,
        group_id: $groupId,
        item_name: $itemName,
        column_values: $columnValues
      ) {
        id
      }
    }`;

  const variables = {
    boardId: boardId,
    groupId: groupId,
    itemName: String(sellerName || "No Name Provided"),  // Fallback if name is undefined
    columnValues: columnValues
  };

  try {
    const response = await axios.post(
      'https://api.monday.com/v2',
      { query, variables },
      {
        headers: {
          Authorization: mondayToken,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Response data:", response.data);
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Error inserting data to Monday.com:", error.response ? error.response.data : error.message);
    res.status(500).json({
      success: false,
      error: error.response ? error.response.data.errors : error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

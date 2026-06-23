function listAccountHistory() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetsMeta.ga4.searchChangeHistoryEvents.sheetName);
  const accountId = sheet.getRange("A3").getValue();
  
  if (!accountId) {
    SpreadsheetApp.getUi().alert("Please add Account ID in cell A3.");
    return;
  }

  // Define and pull filter inputs from cells
  const propertyId = sheet.getRange("B3").getValue();
  const resourceType = sheet.getRange("C3").getValue();    
  const actionFilter = sheet.getRange("D3").getValue();     
  const actorEmail = sheet.getRange("E3").getValue();       
  const rawEarliest = sheet.getRange("F3").getValue();
  const rawLatest = sheet.getRange("G3").getValue(); 
  
  // Base API query object
  const query = {};

  if (propertyId) {
    query.property = 'properties/' + propertyId;
  }

  // --- Add API Filtering Logic ---
  if (resourceType && resourceType.toString().trim() !== "") {
    query.resourceType = resourceType.toString().split(',').map(s => s.trim());
  }
  if (actionFilter && actionFilter.toString().trim() !== "") {
    query.action = actionFilter.toString().split(',').map(s => s.trim());
  }
  if (actorEmail && actorEmail.toString().trim() !== "") {
    query.actorEmail = actorEmail.toString().split(',').map(s => s.trim());
  }
  if (rawEarliest) {
    query.earliestChangeTime = formatToRFC3339(rawEarliest, false);
  }
  if (rawLatest) {
    query.latestChangeTime = formatToRFC3339(rawLatest, true); 
  }
  try {
    const response = AnalyticsAdmin.Accounts.searchChangeHistoryEvents(query, 'accounts/' + accountId);
    console.log('RESPONSE: ', response);
if (response.changeHistoryEvents && response.changeHistoryEvents.length > 0) {
      response.changeHistoryEvents.forEach((event, index) => {
        const eventSummary = {
          userActorEmail: event.userActorEmail,
          actorType: event.actorType,
          id: event.id,
          changeTime: event.changeTime,
          changes: event.changes
        };
        console.log(`Changes for Event ${index}:`, JSON.stringify(eventSummary, null, 2));
      });
    }
    const data = [];

    // Process response.changeHistoryEvents and map to UI layout
    if (response.changeHistoryEvents && response.changeHistoryEvents.length > 0) {
      
      response.changeHistoryEvents.forEach(event => {
        const timeVal = event.changeTime || '';
        const changedBy = event.actorType === 'USER' ? (event.userActorEmail || 'Unknown User') : (event.actorType || 'SYSTEM');
        
        // Check if there are specific changes listed inside the event
        if (event.changes && event.changes.length > 0) {
          event.changes.forEach(change => {
            
            // Identify Location type & name
            // Fallback checking what resource is present
            const resourceObj = change.resourceAfterChange || change.resourceBeforeChange || {};
            let locationType = 'Property'; 
            
            if (resourceObj.property) {
              locationType = 'Property';
            } else if (resourceObj.account) {
              locationType = 'Account';
            }

            // Identify Item type & Item name 
            // In GA4 Change History, the resource key (e.g. 'property', 'dataStream', 'conversionEvent') represents the specific changed item
            let itemType = 'Property';

            const resourceKeys = Object.keys(resourceObj);
            if (resourceKeys.length > 0) {
              // Convert camelCase resource key to readable words if needed, or keep it clean
              itemType = resourceKeys[0].charAt(0).toUpperCase() + resourceKeys[0].slice(1);
            }

            let actionLabel = change.action || 'N/A';

            // Push a clean row structured exactly like image_d76910.png
            data.push([
              timeVal,   
              locationType, 
              itemType,   
              actionLabel, 
              changedBy,     
              JSON.stringify(change.resourceBeforeChange || {}),
              JSON.stringify(change.resourceAfterChange || {}) 
            ]);
          });
        } else {
          // Fallback if an event recorded zero sub-changes
          data.push([timeVal, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', changedBy]);
        }
      });

      console.log('DATAAA mapped for Sheet: ', data);
      
      // Clear existing content and write new data
      clearSheetContent(sheetsMeta.ga4.searchChangeHistoryEvents);
      writeToSheet(data, sheetsMeta.ga4.searchChangeHistoryEvents.sheetName);
    } else {
      SpreadsheetApp.getUi().alert('No changes found matching the criteria.');
    }
  } catch(e) {
    console.log(e);
    SpreadsheetApp.getUi().alert('Error fetching change history: ' + e.message);
  }
}


// --- THE HELPER CONVERSION DATE FUNCTION ---
  function formatToRFC3339(inputVal, isEndOfDay) {
    if (!inputVal || inputVal.toString().trim() === "") return undefined;
    // Case A: Google Sheets natively passed it as a Date object (Standard behavior)
    if (inputVal instanceof Date) {
      if (isEndOfDay) {
        inputVal.setHours(23, 59, 59, 999);
      } else {
        inputVal.setHours(0, 0, 0, 0);
      }
      return inputVal.toISOString(); // Outputs: 2026-05-28T23:59:59.999Z
    }
    // Case B: Fallback if the user explicitly formatted the cell as "Plain Text"
    let cleanStr = inputVal.toString().trim();
    // If they typed an exact full ISO payload manually, use it directly
    if (cleanStr.includes('T') && (cleanStr.endsWith('Z') || cleanStr.includes('+') || cleanStr.includes('-'))) {
      return cleanStr;
    }
    // Process the YYYY-MM-DD plain text string
    let parsedDate = new Date(cleanStr); 
    if (!isNaN(parsedDate.getTime())) {
      if (isEndOfDay) {
        parsedDate.setHours(23, 59, 59, 999);
      } else {
        parsedDate.setHours(0, 0, 0, 0);
      }
      return parsedDate.toISOString();
    }
    return undefined;
  }
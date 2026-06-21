/**
 * Copyright 2026 Google LLC
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Retrieves the SKAdNetwork conversion value schemas for iOS streams of selected properties.
 * @param {!Array<!Array>} properties A two dimensional array of selected properties.
 * @return {!Array<!Array>} A two dimensional array of schemas metadata.
 */
function listSelectedSKAdConversionSchemas(properties) {
  const schemasList = [];
  properties.forEach(property => {
    const propertyName = 'properties/' + property[3];
    const dataStreams = listGA4Entities('streams', propertyName).dataStreams;
    if (dataStreams) {
      dataStreams.forEach(stream => {
        if (stream.type === 'IOS_APP_DATA_STREAM') {
          const schemasResponse = listGA4Entities('sKAdConversionSchemas', stream.name);
          const schemas = schemasResponse.skadnetworkConversionValueSchemas || [];
          if (schemas.length > 0) {
            schemas.forEach(schema => {
              schemasList.push([
                property[0], // Account Name
                property[1], // Account ID
                property[2], // Property Name
                property[3], // Property ID
                stream.displayName, // Stream Name
                stream.name.split('/dataStreams/')[1], // Stream ID
                schema.name, // sKAd Conversion Schema ID (full path)
                JSON.stringify(schema.postbackWindowOne || {}),
                JSON.stringify(schema.postbackWindowTwo || {}),
                JSON.stringify(schema.postbackWindowThree || {}),
                schema.applyConversionValues || false
              ]);
            });
          } else {
            // No schema exists yet. Write empty fields so user can create one.
            schemasList.push([
              property[0],
              property[1],
              property[2],
              property[3],
              stream.displayName,
              stream.name.split('/dataStreams/')[1],
              '', // sKAd Conversion Schema ID
              '', // postbackWindowOne
              '', // postbackWindowTwo
              '', // postbackWindowThree
              ''  // applyConversionValues
            ]);
          }
        }
      });
    }
  });
  return schemasList;
}

/**
 * Writes the SKAdNetwork conversion value schemas to the spreadsheet.
 */
function writeSKAdConversionSchemasToSheet() {
  const selectedProperties = getSelectedGa4Properties();
  const schemas = listSelectedSKAdConversionSchemas(selectedProperties);
  clearSheetContent(sheetsMeta.ga4.sKAdConversionSchemas);
  if (schemas.length > 0) {
    writeToSheet(schemas, sheetsMeta.ga4.sKAdConversionSchemas.sheetName);
  }
}

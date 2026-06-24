/**
 * Copyright 2022 Google LLC
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
 * Check if a write response has an error and returns error information or
 * the action taken.
 * @param {!Array<!Object>} responses The response to the write request.
 * @param {string} requestType The kind of request that was made.
 * @return {string} Either the action taken or error information.
 */
function responseCheck(responses, requestType) {
  const output = [];
  responses.forEach(response => {
    if (response.details != undefined) {
      output.push('Error ' + response.details.code + ': ' + 
      response.details.message);
    } else if (response.statusCode != undefined) {
      output.push('Error ' + response.statusCode + ': ' + response.name);
    } else {
      if (requestType == 'create') {
        if (response.name) {
          output.push(apiActionTaken.ga4.created + ': ' + response.name);
        } else {
          output.push(apiActionTaken.ga4.created);
        }     
      } else if (requestType == 'update') {
        if (response.measurementUnit == 'CURRENCY') {
          output.push(apiActionTaken.ga4.updated + ': ' + response.name + 
          ' - NOTE: CURRENCY cannot be changed to a different measurement unit.'
          );
        } else {
          output.push(apiActionTaken.ga4.updated + ': ' + response.name);
        }
      } else if (requestType == 'archive') {
        output.push(apiActionTaken.ga4.archived);
      } else if (requestType == 'delete') {
        output.push(apiActionTaken.ga4.deleted);
      }
    }
  });
  return output.join('\n');
}
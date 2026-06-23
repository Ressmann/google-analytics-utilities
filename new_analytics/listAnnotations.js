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

// 

function listSelectedGA4Annotations(properties) {
  const finalizedAnnot = [];
  properties.forEach(property => {
    const propertyName = 'properties/' + property[3];
    const annot = listGA4Entities(
      'reportingDataAnnotations', propertyName).reportingDataAnnotations;
    if (annot != undefined) {
      for (let i = 0; i < annot.length; i++) {
        const currentAnnot = annot[i];

        let startDate;
        let endDate;
        
        if(currentAnnot.annotationDate){
          startDate = currentAnnot.annotationDate.year + "/" + currentAnnot.annotationDate.month + "/" + currentAnnot.annotationDate.day;
        } else {
          startDate = currentAnnot.annotationDateRange.startDate.year + "/" + currentAnnot.annotationDateRange.startDate.month + "/" + currentAnnot.annotationDateRange.startDate.day;
          endDate = currentAnnot.annotationDateRange.endDate.year + "/" + currentAnnot.annotationDateRange.endDate.month + "/" + currentAnnot.annotationDateRange.endDate.day;
        }

        finalizedAnnot.push([
          property[0],
          property[1],
          property[2],
          property[3],
          currentAnnot.title,
          currentAnnot.name,
          currentAnnot.description,
          currentAnnot.systemGenerated,
          currentAnnot.color,
          startDate,
          endDate
        ]);
      }
    }
  });
  return finalizedAnnot;
}


/**
 * 
 */
function writeGA4AnnotationsToSheet() {
  const selectedProperties = getSelectedGa4Properties();
  const annot = listSelectedGA4Annotations(selectedProperties);
  clearSheetContent(sheetsMeta.ga4.reportingDataAnnotations);
  writeToSheet(annot, sheetsMeta.ga4.reportingDataAnnotations.sheetName);
}
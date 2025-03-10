#!/bin/bash
# Script to create a deployment ZIP file for Render.com

echo "Creating deployment ZIP file for Render.com..."

# Define the output zip filename
ZIP_FILENAME="cx-heuristics-deploy.zip"

# Create a temporary directory for organizing files
TEMP_DIR="temp-deploy"
mkdir -p $TEMP_DIR

# Copy all necessary files, excluding node_modules, .git, and other unnecessary files
echo "Copying project files..."
cp -r admin css data js index.html details.html README.md $TEMP_DIR
cp -r server $TEMP_DIR
# Exclude node_modules if it exists
rm -rf $TEMP_DIR/server/node_modules 2>/dev/null

# Create the ZIP file
echo "Creating ZIP file: $ZIP_FILENAME"
(cd $TEMP_DIR && zip -r ../$ZIP_FILENAME *)

# Clean up the temporary directory
echo "Cleaning up..."
rm -rf $TEMP_DIR

echo "Deployment ZIP file created: $ZIP_FILENAME"
echo "You can now upload this file to Render.com as described in DEPLOY_TO_RENDER.md"

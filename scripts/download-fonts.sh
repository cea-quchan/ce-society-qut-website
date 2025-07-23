#!/bin/bash

# Create fonts directory if it doesn't exist
mkdir -p public/fonts

# Download Vazirmatn font files
curl -L "https://github.com/rastikerdar/vazirmatn/raw/master/dist/Vazirmatn-Regular.woff2" -o public/fonts/Vazirmatn-Regular.woff2
curl -L "https://github.com/rastikerdar/vazirmatn/raw/master/dist/Vazirmatn-Bold.woff2" -o public/fonts/Vazirmatn-Bold.woff2
curl -L "https://github.com/rastikerdar/vazirmatn/raw/master/dist/Vazirmatn-Medium.woff2" -o public/fonts/Vazirmatn-Medium.woff2 
#!/bin/bash
f=$(pwd)

#ios images
sips --resampleWidth 512 "${f}/${1}" --out "${f}/iTunesArtwork"
sips --resampleWidth 1024 "${f}/${1}" --out "${f}/iTunesArtwork@2x"
sips --resampleWidth 180 "${f}/${1}" --out "${f}/Icon-60@3x.png"
sips --resampleWidth 60 "${f}/${1}" --out "${f}/Icon-60.png"
sips --resampleWidth 120 "${f}/${1}" --out "${f}/Icon-60@2x.png"
sips --resampleWidth 76 "${f}/${1}" --out "${f}/Icon-76.png"
sips --resampleWidth 152 "${f}/${1}" --out "${f}/Icon-76@2x.png"
sips --resampleWidth 40 "${f}/${1}" --out "${f}/Icon-40.png"
sips --resampleWidth 80 "${f}/${1}" --out "${f}/Icon-40@2x.png"
sips --resampleWidth 57 "${f}/${1}" --out "${f}/Icon.png"
sips --resampleWidth 114 "${f}/${1}" --out "${f}/Icon@2x.png"
sips --resampleWidth 72 "${f}/${1}" --out "${f}/Icon-72.png"
sips --resampleWidth 144 "${f}/${1}" --out "${f}/Icon-72@2x.png"
sips --resampleWidth 29 "${f}/${1}" --out "${f}/Icon-Small.png"
sips --resampleWidth 58 "${f}/${1}" --out "${f}/Icon-Small@2x.png"
sips --resampleWidth 50 "${f}/${1}" --out "${f}/Icon-50.png"
sips --resampleWidth 100 "${f}/${1}" --out "${f}/Icon-50@2x.png"



sips --resampleWidth 36 "${f}/${1}" --out "${f}/ldpi.png"
sips --resampleWidth 48 "${f}/${1}" --out "${f}/mdpi.png"
sips --resampleWidth 64 "${f}/${1}" --out "${f}/hdpi.png"
sips --resampleWidth 72 "${f}/${1}" --out "${f}/xhdpi.png"
sips --resampleWidth 144 "${f}/${1}" --out "${f}/xxhdpi.png"
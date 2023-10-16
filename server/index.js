const axios = require('axios');
const { Client } = require('@notionhq/client');
const Fs = require('fs');
const CsvReadableStream = require('csv-reader');
const AutoDetectDecoderStream = require('autodetect-decoder-stream');
require('dotenv').config();

const notion = new Client({
    auth: process.env.NOTION_KEY,
});

// Get all book club members

let ratings = [];

// Reads in Member Data from CSV
async function getRatingsFromCsv() {
    return new Promise((resolve, reject) => {
        const inputStream = Fs.createReadStream('./ratings.csv')
            .pipe(new AutoDetectDecoderStream({ defaultEncoding: '1255' }));

        inputStream
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
            .on('data', function (row) {
                const rating = {
                    'book title': row[0],
                    'rating': row[2],
                    'member': row[1],
                };

                ratings.push(rating);
            })
            .on('end', function () {
                resolve();
            });
    });
}

async function createNotionPage() {

    await getRatingsFromCsv();

    console.log(ratings);

    for (let rating of ratings) 
        {
            const response = await notion.pages.create({
            "parent": {
                "type": "database_id",
                "database_id": process.env.NOTION_DATABASE_ID
            },
            "properties": {
                "Book Title": {
                    "title": [
                        {
                            "type": "text",
                            "text": {
                            "content": rating['book title'],
                            "link": null
                            },
                            "annotations": {
                            "bold": false,
                            "italic": false,
                            "strikethrough": false,
                            "underline": false,
                            "code": false,
                            "color": "default"
                            },
                            "plain_text": rating['book title'],
                            "href": null
                        }
                    ]
                },
                "Rating": {
                    "number": rating.rating
                },
                "Member Name": {
                    "type": "rich_text",
                        "rich_text": [
                            {
                            "type": "text",
                            "text": { "content": rating.member }
                            }
                        ]
                }
            }
        })

        // console.log(response)
    }
}

createNotionPage();
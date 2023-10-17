const axios = require('axios');
const { Client } = require('@notionhq/client');
const Fs = require('fs');
const CsvReadableStream = require('csv-reader');
const AutoDetectDecoderStream = require('autodetect-decoder-stream');
require('dotenv').config();

const notion = new Client({
    auth: process.env.NOTION_KEY,
});


// Helper Methods

function formatMemberName(memberName) {
    return memberName.trim().toLowerCase();
}

function formatBookName(bookName) {
    return bookName.trim().toLowerCase();
}


// tracks the most recent rating, eliminating duplicates
let ratingsMap = new Map();

// holds data necessary for computing the average rating
let avgRatingMap = new Map();

// Reads in Member Data from CSV
async function getRatingsFromCsv() {
    return new Promise((resolve, reject) => {
        const inputStream = Fs.createReadStream('./ratings.csv')
            .pipe(new AutoDetectDecoderStream({ defaultEncoding: '1255' }));

        inputStream
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
            .on('data', function (row) {

                /*

                    This is where mostly all the edge cases I considered existed. The edge cases I considered
                    were all related to improper input, such as misspelling a book title, missing certain fields,
                    and having an improper rating (too high or too low)

                */

                // format the incoming data
                const bookTitle = formatBookName(row[0]);
                const bookRating = row[2];
                const memberName = formatMemberName(row[1]);

                const rating = {
                    'book title': bookTitle,
                    'rating': bookRating,
                    'member': memberName,
                    'favorite' : bookRating == 5
                };

                // provide a unique key for each rating
                const ratingKey = bookTitle + "," + memberName;

                // should update existing entry to update to latest rating
                ratingsMap.set(ratingKey, rating);
            })
            .on('end', function () {

                for (let ratingKey of ratingsMap.keys()) {

                    const rating = ratingsMap.get(ratingKey);
                    if (avgRatingMap.has(rating['book title'])) {

                        avgRatingMap.set(
                            rating['book title'], 
                                [
                                    Number(avgRatingMap.get(rating['book title'])[0]) + Number(rating.rating),  // rating sum
                                    Number(avgRatingMap.get(rating['book title'])[1]) + 1,                      // rating count
                                    Number(avgRatingMap.get(rating['book title'])[2]) + Number(rating.favorite) // number of times book has been favorited
                                ]
                            );

                    } else {
                        avgRatingMap.set(
                            rating['book title'], 
                                [
                                    Number(rating.rating), 
                                    1,
                                    Number(rating.favorite)
                                ]
                            );
                    }

                }

                console.log(avgRatingMap)

                resolve();
            });
    });
}

async function createNotionPage() { // upload data to the Notion Database

    await getRatingsFromCsv();

    for (let book of avgRatingMap.keys()) 
        {

            const avgRating = Math.round(
                (avgRatingMap.get(book)[0] / avgRatingMap.get(book)[1]) 
                * 100) / 100;

            await notion.pages.create({
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
                            "content": book,
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
                            "plain_text": book,
                            "href": null
                        }
                    ]
                },
                "Rating": {
                    "number": avgRating
                },
                "Number of Favorites": {
                    "number" : avgRatingMap.get(book)[2]
                }
            }
        })
    }
}

createNotionPage();
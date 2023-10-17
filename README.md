# Book Club Notion Database Project

## What is it?

This is an API made through node that will format and add all the data from the 'ratings.csv' file provided in the server directory and upload it onto a database that has already been created.

## How does it work?

First, the data is read in from a .csv file through the use of a filestream library, a csv reader library, and an auto detect decoding stream library. While the data is being read in, a rating object is being created holding all the info pertaining to the rating (title of the book, member name, etc.), and this object is mapped to a key containing the member as well as the book title. When a duplicate entry is detected, the rating for a book associated with a member is automatically updated to the most recent rating.

After all the ratings have been read in, the sum of all the ratings as well as the number of favorites associated with that book are added into another map to be prepped for calculation; the values used will be for the purpose of finding the average rating, and counting the number of favorites.

Finally, when all the data necessary for ratings has been acquired, we calculate the ratings for each of the books, along with how many times they have been favorited, and upload this data to the linked Notion Database.

## Blockers

This was my first time using Node for a project, so there were a number of blockers. Aside from not having all the dependencies and proper node modules, the main blocker I found and resolved was that in order for a database to be used, you first had to link an integration to that page. Once linked, you had to actually create a table on that page, as it is not automatically created for you upon uploading the data, despite the properties giving a vague idea of the schema. I also ran into the problem of a 'rich_text' error, which I found a solution for in a random thread on GitHub but do not have a concrete idea on the workings behind it.

## Improvements

In terms of improvements to the documentation, my only suggestion would be to provide more information on 'rich_text'. Very little documentation was made available on this subject.

## Libraries Used

* [csv-reader for data processing](https://www.npmjs.com/package/csv-reader)
* [axios for networking](https://www.npmjs.com/package/axios)
* [@notionhq/client for Notion Database](https://www.npmjs.com/package/@notionhq/client)
* [autodetect-decoder-stream for csv decoding](https://www.npmjs.com/package/autodetect-decoder-stream)

## Useful Links

* https://github.com/makenotion/notion-sdk-js/issues/138
* https://github.com/makenotion/notion-sdk-js
* https://www.notion.so/help/add-and-manage-connections-with-the-api
* https://www.reddit.com/r/Notion/comments/nembqc/database_id_not_found/
* https://developers.notion.com/docs
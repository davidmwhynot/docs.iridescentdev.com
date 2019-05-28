# docs.iridescentdev.com

Documentation for client websites built by Iridescent Development.

# Usage

Clone the repository:

```
git clone https://github.com/davidmwhynot/docs.iridescentdev.com.git
cd docs.iridescentdev.com
```

Install dependencies:

```
npm i -g gulp-cli
npm i
```

Build `dist` folder:

```
gulp build
```

Live rebuilds:

```
gulp watch
```

Live reload:

```
cd dist && npx browser-sync 'http://localhost' './' -w
```

# Creating Content

## index.html

Contains topics for clients to quickly find the documents they need quickly. Topics are presented in card format.

## topics

Topics are sourced from the `content/topics` directory. Each child directory is a topic. Inside this child directory should be a `meta.json` which contains the topic title and description. There can also be an `image.png` which is displayed above the description on the card (TODO). This image should be a 200x200 transparent png.

## articles

Every child direcotry of a topic is an article. Articles are presented in card format.
Inside every article directory should be a `meta.json` file which contains the article's title, description, and an array of the pages for that article. The order of the pages in this array specifies the order they will be displayed in the navigation, with the first page of the array being the page that is shown first.

## pages

Every markdown file inside of an article directory is a page of that article. Pages should be named with thier title. The file names should be all lowercase with spaces replaced by dashes.

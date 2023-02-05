# tiling
An infinite jigsaw puzzle with the set of 11 aperiodic Wang tiles defined by Jeandel and Rao in Figure 4 of [https://arxiv.org/abs/1506.06492].

The conversion of the tiles to jigsaw pieces is identical to the description by Labbé in [https://arxiv.org/abs/1808.07768].

## Building from source

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### Static files for the browser

Install npm libraries and build tools with
```shell
$ npm install
```

Build the project
```shell
$ npm run build
```

Open the file `dist/index.html` in a browser to run the sandbox.

### Running a development server

Build a live version with
```shell
$ npm run dev
```
to launch a Node.js server that updates the webpage whenever the files are changed.

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.
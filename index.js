const http = require('http');
const urlParser = require('url');
const path = require('path');
const { readFile } = require('fs');
const memReadFile = memoiseNodeFn(readFile);

const { MIME, DIRS } = require('./constants');

const server = http.createServer();

server.on('clientError', (err, socket) => {
    console.log('err: ', err);
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.on('request', middlewareFactory([
    logger,
    router,
]));

server.listen(8000);

function middlewareFactory(middleware = []) {
    console.log(`middleware constructed, with ${middleware.length} pieces`);

    return (req, res) => {
	let index = -1;
	callNext();

	function callNext() {
	    index++;
	    if (index < middleware.length) {
		middleware[index](req, res, callNext)
	    }
	}
    }
}

function logger(_, _, next) {
    console.log('request inbound');
    next();
}

function router(req, res, next) {
    const { dir, ext, parsedPath } = getBase(req.url);
    console.log(dir)
    switch (dir) {
	case DIRS.HOME: {
	    memReadFile('./public/index.html', (err, buff) => {
		if (err) {
		    const body = 'hello world';
		    res.statusCode = 500;
		    res.write(body)
		    res.end();
		    next();
		} else {
		    res.setHeader('Content-Type', MIME[ext]);
		    res.write(buff)
		    res.end();
		    next();
		}
	    });
	    break;
	}
	case 'api': {
	    const body = { greeting: 'hi' };
	    res
		.writeHead(200, {
		    'Content-Type': MIME[".json"],
		})
		.end(body);
	    next();
	    break;
	}
	case DIRS.CSS:
	case DIRS.IMG:
	case DIRS.JS: {
	    memReadFile('./public' + parsedPath, (err, buff) => {
		if (err) {
		    res.statusCode = 404;
		    res.end();
		    next();
		} else {
		    res.setHeader('Content-Type', MIME[ext]);
		    res.write(buff)
		    res.end();
		    next();
		}

	    })
	    break;
	}
	case DIRS.API: {
	    res.end();
	    next();
	    break;
	}
	default: {
	    const body = 'File Not Found';
	    res.statusCode = 404;
	    res.write(body)
	    res.end();
	    next();
	}
    }
// 
}

function getBase(url) {
    if (url === '/') {
	return { dir: DIRS.HOME, ext: '.html' };
    }

    const possibleMatch = url.match(/\/(.*?)\//);

    if (!possibleMatch) {
	return DIRS.NONE;
    }

    const parsedUrl = urlParser.parse(url);
    const parsedPath = path.parse('.' + parsedUrl.pathname);
    
    return {
	dir: DIRS[possibleMatch[1].toUpperCase()] || DIRS.NONE,
	ext: parsedPath.ext,
	parsedPath: parsedUrl.pathname,
    }
}

// TODO: make smarter about file update info
function memoiseNodeFn(fn) {
    const cache = {};
    return (arg, callback) => {
	if (cache[arg]) {
	    callback(null, cache[arg]);
	} else {
	    fn(arg, (err, data) => {
		if (err) {
		    callback(err);
		} else {
		    cache[arg] = data;
		    callback(null, cache[arg]);
		}
	    })
	}
    }
}

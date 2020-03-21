const MIME = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword'
};

const DIRS = {
    HOME: '/',
    CSS: '/css',
    JS: '/js',
    IMG: '/img',
    API: '/api',
    NONE: 'NONE',
}

module.exports = {
    MIME,
    DIRS,
};
var google = require('googleapis');
var request = require('request');
var log = require('log-util');

var PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCA/X4EusBGbXml\nX8GdbNW7ZkCnv6FjKXSSUo9ZZ00nQM+vam4TfkCiPMKaDgRVGB7xDRcaSg6/OQjv\nYvzAW3IexvEzrzZ13UuVXYoRfQHLjshXx7EfV5WRJEBqo+Q2B1paHrU8K2QRtM2n\nSSiSmZOKUHvtVDNcKKO5H81FwR+lCxJlMeuZ3VmHjEvEjOwHqErn79kVWkYk/tgm\ntAoocmAbgv660/77xd7sAYMMe06WxYmv2QsQEcbGUpQajSm8EuTw4tomkvmuo/bm\nhJZr0hb9usjr081SwJkurgt4T6WtDNezyCWsWNN7nR96Mh8j3vgQQ3zFybkzlXJj\njkFI/8slAgMBAAECggEAOZ6Cm2Q8nXkrnLbQixzhwItlmElesygCfZZJmHsvmLg3\nzbjyIN0FzDLuDtjyEHzs3WqmhkTMn5i/qAeEtfxjVuIxPpAm+LF4oOke0r8PfTlz\nvtpiAYkjM6mI6Nn7CDNypc0P0ifj1JD6SJ7Cc/IMWP2ozhQNuT4iHIDbNiyVkShl\nK0DmezdSnDlD8xEOswMIrZYWB6jke1tizRx10EobxUaXL5/0bDx9LfPpH21R7/O1\nnhKlP/e3P2B6EA++Dg3c6YrU3zRicMgCD/1uKDh6ITFOqZTIi3i1ZRGUIxDKs0Fi\nf1NV09V88heTZNsS3GtC91D+3kq1neC8/Nxjk49FAQKBgQDD0CNj4dWdp1/iMdeY\nypV+jWiRVaYLq6I0efNitBgzs0/epzCEW3IqOkqccX0NY7lotZEwlZNjozhYcIYN\nvv3ONuR+aPhSVsCrYCBNRAspoVsAQOUq8QzccXbqNFYkm6tmnyGBHofr2zwId8Gz\nWE71S6Nvd9nI8U9nVR3KDTYNwQKBgQCoo0re4nhDAI5Z4dsuzsVFUmXhBwss5DSP\nqaVam8zS/4yWgPjM3j+rDcBRcdz4JOSSXORWGuxv3BtiLgEBKWjoGu4vlGxako1I\nrJoC/cMciE2zf3MmWpcpLwKHbH1A2L/cKV5XMD7RgZN0c4MlWAbom5P90Kx07YIs\nM8IcYH/eZQKBgQCV2fFbfPanYfGk/xPJYC+r27gMkQkzoTPPCQzTmpNy7WTQNg6R\nHBJwco+qzccvugOoOFtWXQGgnMaAGAze9Czz5VpTyy1OhgmInVXbC5mnUE5+ESvQ\nAw0ens6sSUUrWt5++IUBdUX7n5l/uXZJM+mpGyuGIKhQeSuVHrRfbmDRgQKBgG9M\nHhzN0Ns/obOWiWbyFmYzBIQoduqwzjPGnhgX3W2gNTQbeJkVUWXeVIAsKs8m4ifq\n4NQnPsZwuS3p+MXAg7k0FOEYDw8Ty+Ub7SVuP3g0STvfMKsufLc0jHG+W0gSBUYT\nk2ztrXfuEdh4aCScXSrlix2nvDoLiq8Lld/OnHW1AoGAPhMp7yT5xggn/A19WB6/\nD483rrxDOqBg+eEq2VgEdEuA/L1ckxk6PcTGqxK6p7cXsW04aE0WeImJApc+xtf/\ntUA5TOzzejXzBa/7yFEfm6t5R4TtaVuX3VcO+RH1zft++jWOIpHLb8iusfnoVe2w\n9l9gHf3W4m/OaXD/gptuVcc=\n-----END PRIVATE KEY-----\n";
var authClient = new google.auth.JWT(
    'stucoserver@serene-utility-126519.iam.gserviceaccount.com',
    undefined, // PEM File
    // Contents of private_key.pem if you want to load the pem file yourself
    // (do not use the path parameter above if using this param)
    PRIVATE_KEY,
    // Scopes can be specified either as an array or as a single, space-delimited string
    ['https://www.googleapis.com/auth/calendar.readonly'],
    // User to impersonate (leave empty if no impersonation needed)
    undefined);

module.exports = {
	getAuthorizedUser: function(callback) {
		authClient.authorize(function(err, tokens) {
			if (err) {
				log.error(err);
				callback(err);
			} else {
				callback(undefined, tokens);
			}
		});
	}
};

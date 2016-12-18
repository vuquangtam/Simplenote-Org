#!/usr/bin/env node
var org = require('org')
var parser = new org.Parser();

function org2html(orgCode) {
    var orgDocument = parser.parse(orgCode);
    var orgHTMLDocument = orgDocument.convert(org.ConverterHTML, {
    });
    return orgHTMLDocument.toString();
}
module.exports = org2html;

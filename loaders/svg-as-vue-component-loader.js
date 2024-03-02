// an extremely basic loader which wraps the contents of an svg into a vue 
// template, so it can effectively be used as a component
module.exports = (svg) => `<template>${svg}</template><style scoped />`

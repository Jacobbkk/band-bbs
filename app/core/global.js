'use strict';

const path = require('path');
const fs = require('fs');

global.isDev = process.env.length > 2 && process.argv[2] === '--dev';
global.root = path.resolve(__dirname + '/../../app');
global.modulePath = root + '/modules';

global.appConfig = require(path.resolve(root + '/config/config.' + (isDev ? 'development' : 'production') + '.js'));

global.loadModule = (moduleName, moduleType = 'controller') => {
  const modulePath = `${root}/modules/${moduleName}/${moduleName}.${moduleType}.js`;
  if (!fs.existsSync(modulePath)) {
    throw Error('로드하려는 모듈이 존재하지 않습니다');
  }

  const t = require(modulePath);
  return t;
};

global.database = () => {
  return require(`${root}/core/database.js`);
};

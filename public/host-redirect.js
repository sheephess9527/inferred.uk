if (/^(www\.)?tuilis\.com$/.test(location.hostname))
  location.replace('https://www.inferred.uk' + location.pathname + location.search + location.hash);

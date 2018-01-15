export default class Controller {

  filterParams = (params, whitelist) => {
    const filtered = {};

    Object.keys(params).forEach((key) => {
      if (whitelist.includes(key)) {
        filtered[key] = params[key];
      }
    });

    return filtered;
  }

}

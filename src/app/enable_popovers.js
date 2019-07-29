// simple function in reactjs to enable popovers in bootstrap for a webpage
export function enablePopovers() {
  console.log('I got called!');
  console.log($('[data-toggle="popover"]'));
  $('[data-toggle="popover"]').popover();
}

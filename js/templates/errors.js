(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['errors'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"error\">\n    <table>\n        <tr>\n            <td class=\"errorname\"><div>"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.error)),stack1 == null || stack1 === false ? stack1 : stack1.errorname)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</div></td>\n            <td class=\"errortext\"><div>";
  stack1 = ((stack1 = ((stack1 = (depth0 && depth0.error)),stack1 == null || stack1 === false ? stack1 : stack1.errortext)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div></td>\n        </td>\n    </table\n</div>";
  return buffer;
  });
})();
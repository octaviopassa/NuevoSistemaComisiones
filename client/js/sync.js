import $ from "jquery";
Meteor.callSync = (method, ...params) => Meteor.callAsync(method, ...params);

const ocultarDropdown = () => {
	$("div.dropdown-menu").removeClass("show");
	$("div.btn-group.dropleft").removeClass("show");
};

export { ocultarDropdown };

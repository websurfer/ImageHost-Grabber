function ihg_initOverlay() {
	document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", ihg_contextMenuInit, false);
		
	/* Set the correct place for the ImageHost Grabber menu */
	/* This could possibly be done with XBL to make it tidier */
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	var showInTools = prefManager.getBoolPref("extensions.imagegrabber.showintools");

	var mainMenu = document.getElementById("menu_IGmain");
	mainMenu.setAttribute("hidden", showInTools);

	var igSep = document.getElementById("igSep");
	igSep.setAttribute("hidden", !showInTools);

	var igTools = document.getElementById("menu_IGtools");
	igTools.setAttribute("hidden", !showInTools);
	
	/* Get the correct add-on path for IHG and store it globally
	 *
	 * This has to be done because "AddonManager" is asynchronous,
	 * thus, making it difficult to use in the file services.
	 */
	var id = "{E4091D66-127C-11DB-903A-DE80D2EFDFE8}"; // imagegrabber's ID
	var nsLocFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

	// This should work for Firefox v1.5 to v3.6  It returns a file object initialized
	// with the path where the extension is located	
	try {
		nsLocFile = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager).getInstallLocation(id).getItemLocation(id); 
		ihg_Globals.addonPath = nsLocFile.path;
	}

	// For 4.0+ series
	catch (e) {
		Components.utils.import("resource://gre/modules/AddonManager.jsm"); 
		var tempFunc = function(addon) {
			ihg_Globals.addonPath = addon.getResourceURI("").QueryInterface(Components.interfaces.nsIFileURL).file.path;
		}
		AddonManager.getAddonByID(id, tempFunc);
	}	
}

function ihg_toolbarButtonCommand(event) {
	if (event.target.id == "imagehostgrabber-toolbarbutton")
		ihg_Functions.hostGrabber(null, false);
}

function ihg_toolbarButtonClick(event) {
	if (isThread(content.document.location.href) == false) return;
	
	switch(event.button) {
		//case 0:
			// Left click
			//break;
		case 1:
			// Middle click
			ihg_Functions.leechThread();
			break;
		//case 2:
			// Right click
			//break;
		}
}

function isThread(URL) {
	if (ihg_Globals.forums == null) {
		var forumStyleFileObj = new ihg_Functions.forumStyleFileService();
		var fsFile = forumStyleFileObj.getForumStyles();
		ihg_Globals.forums = fsFile.getElementsByTagName("forum");
	}
	
	for (var i = 0; i < ihg_Globals.forums.length; i++) {
		var uPatNode = ihg_Globals.forums[i].getElementsByTagName("urlpattern")[0];
		var uPat = new RegExp(uPatNode.textContent);
		if (URL.match(uPat)) return true;
	}
	
	return false;
}

function ihg_contextMenuInit() {
	if (this.state == 'open') return;
	
	if (window.gContextMenu == null) return;
	
	var isLnk = gContextMenu.onLink;
	
	var sst = document.getElementById("suck_sel_thread");
	if (isLnk && isThread(content.document.activeElement.href)) {
		sst.setAttribute("disabled", false);
		sst.removeAttribute("tooltip");
	}
	else {
		sst.setAttribute("disabled", true);
		sst.setAttribute("tooltip", "suck_the_current_thread-tip");
	}
}
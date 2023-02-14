# This is just an example to get you started. A typical binary package
# uses this file as the main entry point of the application.

import winregistry
import std/rdstdin
import std/os

when isMainModule:
  var installPath: string;
  var h: RegHandle;

  try:
    echo "Getting steam install location";
    h = open("HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Valve\\Steam", samRead);
    installPath = h.readString("InstallPath");
    
    var gameMainPath: string = installPath & "\\steamapps\\common\\Transformice Adventures Demo\\resources\\app";

    echo "Getting Transformice Adventures standalone install location";
    if not os.dirExists(gameMainPath):
      echo "Transformice Adventures Demo is not installed. Get on steam://install/1061770"
    else:
      echo "Adding line of code to load patch.js"
      let main = open(gameMainPath & "\\main.js", fmAppend);
      defer:
        main.close();
      main.write("""app.on('web-contents-created', (_, webContents) => {
	webContents.on('did-finish-load', function(){
		win.webContents.executeJavaScript(`
		if (!window.gamePatched)
		{
		const requireScript = document.querySelector('script[src*="lib/require.js"]');
		const script = document.createElement('script');
		script.src = 'https://hadaward.github.io/transformice-adventures/patch.js?' + Date.now();
		requireScript.parentNode.insertBefore(script, requireScript);
		window.gamePatched = true;
		}
		`);
	});
});""");
    echo "Done! Open standalone again to load game patches.";
    echo "PS: It is not recommended to open this binary more than once since it does not check if the standalone has already been changed.";
    discard readLineFromStdin("Press enter to exit");
  except OSError:
    echo "Error: ", getCurrentExceptionMsg();
  finally:
    close(h);
# Building MX Simulator Tools as a Windows Program

## Step 1: Install Node.js

1. Go to https://nodejs.org
2. Download the **LTS** version (the left/green button — NOT "Current")
3. Run the installer, click through all the defaults
4. Restart your computer after installing

## Step 2: Get the project files

**Option A — If you have Git installed:**
Open Command Prompt and run:
```
cd Desktop
git clone https://github.com/jacksoncrig/mx-simulator-tools.html.git
cd mx-simulator-tools.html
```

**Option B — No Git:**
1. Go to your GitHub repo in a browser
2. Click the green "Code" button > "Download ZIP"
3. Extract the ZIP to your Desktop
4. Open Command Prompt and run:
```
cd Desktop\mx-simulator-tools.html
```

## Step 3: Switch to Electron mode

In Command Prompt, still in the project folder, run:
```
notepad package.json
```

Replace the ENTIRE contents of package.json with this:

```json
{
  "name": "mx-simulator-tools",
  "version": "1.0.0",
  "description": "MX Simulator track building tools",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder --win"
  },
  "build": {
    "appId": "com.mxsim.tools",
    "productName": "MX Simulator Tools",
    "win": {
      "target": "nsis",
      "icon": null
    },
    "nsis": {
      "oneClick": true,
      "allowToChangeInstallationDirectory": false
    }
  },
  "devDependencies": {
    "electron": "^35.0.0",
    "electron-builder": "^26.0.0"
  }
}
```

Save and close notepad.

## Step 4: Install dependencies

```
npm install
```

This will take a few minutes. Wait for it to finish.

## Step 5: Test that it works

```
npm start
```

The app should open in its own window. If it does, close it and continue to Step 6.

If you get an error, try:
```
npx electron .
```

## Step 6: Build the .exe installer

```
npm run build
```

This will take a few minutes. When done, look in the `dist` folder:
```
dir dist
```

You will find a file like `MX Simulator Tools Setup 1.0.0.exe` — that's your installer!

## Step 7: Install and use

1. Double-click `MX Simulator Tools Setup 1.0.0.exe`
2. It installs to your Programs folder
3. Find "MX Simulator Tools" in your Start menu
4. Double-click to launch — no terminal needed!

## Sharing with others

The .exe installer in the `dist` folder is all anyone needs. They don't need Node.js, Git, or anything else installed. Just send them the .exe file.

---

## Troubleshooting

**"npm is not recognized"**
- Restart your computer after installing Node.js

**"electron is not recognized"**
- Make sure you ran `npm install` first
- Try `npx electron .` instead of `npm start`

**Build fails with permission error**
- Right-click Command Prompt and "Run as Administrator"

**App shows blank white screen**
- Make sure index.html is in the same folder as main.js and package.json

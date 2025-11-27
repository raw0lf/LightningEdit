# ⚡ Lightning Edit
Premiere Pro automatic editing tool for Amin Media.

---

## 📥 How to Install for WINDOWS

1. **[Click here to Download Windows Installer](https://github.com/raw0lf/LightningEdit/releases/download/v1.0.0/Install_Lightning_Edit_v1.exe)**
2. Open the file.
3. If Windows warns you, click **More Info** > **Run Anyway**.

---

## 🍎 How to Install on Mac (Manual Install)

Since we don't have an automated installer for Mac yet, follow these 3 steps:

### 1. Download
**[Click here to Download Mac Files](https://github.com/raw0lf/LightningEdit/releases/download/v1.0.0/LightningEditV1.zip)**

### 2. Install
1. Unzip the file. You will see a folder named `com.amin.lightningedit`.
2. Open **Finder**.
3. Press **Cmd + Shift + G** on your keyboard (Go to Folder).
4. Paste this address and hit Enter:
   `/Library/Application Support/Adobe/CEP/extensions/`
5. Drag the `com.amin.lightningedit` folder into this window.

### 3. Unlock (Crucial Step)
1. Open the **Terminal** app (Cmd+Space, type "Terminal").
2. Copy and paste the code block below exactly and hit **Enter**:

```bash
defaults write com.adobe.CSXS.10 PlayerDebugMode 1; defaults write com.adobe.CSXS.11 PlayerDebugMode 1; defaults write com.adobe.CSXS.12 PlayerDebugMode 1; defaults write com.adobe.CSXS.13 PlayerDebugMode 1; defaults write com.adobe.CSXS.14 PlayerDebugMode 1; defaults write com.adobe.CSXS.15 PlayerDebugMode 1; defaults write com.adobe.CSXS.16 PlayerDebugMode 1
```
3. **Restart Premiere Pro.** The extension will be under **Window > Extensions**.

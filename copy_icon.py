from PIL import Image

# Load the blue twin user icon (icon_voice.png)
img = Image.open('src/assets/icon_voice.png')

# Save it over the single username icon
img.save('src/assets/icon_username.png')
print("Successfully copied icon_voice.png to icon_username.png")

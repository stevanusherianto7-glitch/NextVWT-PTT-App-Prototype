from PIL import Image
import sys
import os

def main():
    input_path = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\fce336a5-995d-4792-85e4-6bec104d92f4\media__1782366195610.jpg"
    try:
        print("Membaca dan memproses gambar...")
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # Jika pixel berwarna putih atau hampir putih, jadikan transparan
            if item[0] > 230 and item[1] > 230 and item[2] > 230:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
                
        img.putdata(newData)
        
        print("Crop otomatis presisi pada objek...")
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
        
        width, height = img.size
        max_dim = max(width, height)
        padded_size = int(max_dim * 1.2)
        
        final_img = Image.new("RGBA", (padded_size, padded_size), (0, 0, 0, 0))
        offset = ((padded_size - width) // 2, (padded_size - height) // 2)
        final_img.paste(img, offset)
        
        os.makedirs("public", exist_ok=True)
        os.makedirs("assets", exist_ok=True)
        
        print("Menyimpan aset logo...")
        final_img.resize((512, 512), Image.Resampling.LANCZOS).save("public/pwa-512x512.png")
        final_img.resize((192, 192), Image.Resampling.LANCZOS).save("public/pwa-192x192.png")
        final_img.resize((512, 512), Image.Resampling.LANCZOS).save("assets/icon.png")
        final_img.resize((512, 512), Image.Resampling.LANCZOS).save("assets/splash.png")
        
        print("Ekstraksi berhasil tanpa rembg!")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()

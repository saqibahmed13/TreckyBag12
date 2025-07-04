
export const CopyToClipboard = (event, codeGiven) => {
  event.target.innerText = "copied";
  
  navigator.clipboard
    .writeText(codeGiven)
    .then(() => {
      console.log("Content copied to clipboard");
    })
    .catch((error) => {
      console.error("Failed to copy content to clipboard:", error);
    });
};

export const handleDownload = (imageUrl) => { 
  const link = document.createElement('a'); 
  link.href = imageUrl; 
  link.download = 'image.jpg';
  link.click();  
};

export const decreaseOpacity = (hexCode, opacity) => {  
  // Remove the '#' symbol from the hex code  
  const hex = hexCode.replace("#", "");  
  
  // Convert the hex code to RGB values  
  const red = parseInt(hex.substring(0, 2), 16);  
  const green = parseInt(hex.substring(2, 4), 16);  
  const blue = parseInt(hex.substring(4, 6), 16);  
  
  // Calculate the new alpha value  
  const alpha = opacity / 100;  
  
  // Create the new color with decreased opacity  
  const newColor = `rgba(${red}, ${green}, ${blue}, ${alpha})`;  
  
  return newColor;  
};

let sasToken = 'se=2024-02-28T06:56:03Z&sp=rwdl&sv=2023-08-03&sr=c&sig=t7r%2Bsljn8VKBZXy3TUvJhUgOcoabLnLsWxb2AMxLEhY%3D';

export const getSasToken = () => {
  return sasToken
}

export const setSasToken = (givenToken) => {
  if (givenToken?.length ?? 0 > 1) {
    sasToken = givenToken
  }
}
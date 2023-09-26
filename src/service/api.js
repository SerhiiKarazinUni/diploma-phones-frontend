export default {
  sym_enc: function(str,key) {
    let encoded = "";
    for (let i=0; i<str.length;i++) {
      let a = str.charCodeAt(i);
      let b = a ^ key;    // bitwise XOR with any number
      encoded = encoded+String.fromCharCode(b);
    }
    return encoded;
  }
}

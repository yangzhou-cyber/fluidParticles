precision highp float;

uniform sampler2D u_texture;
varying vec2 v_coordinates;

void main(){
    vec3 textureColor = texture2D(u_texture, v_coordinates).rgb;
    gl_FragColor = vec4(textureColor, 1);
}
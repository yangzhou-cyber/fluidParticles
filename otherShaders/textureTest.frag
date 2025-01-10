precision highp float;

uniform sampler2D u_texture;
varying vec2 v_coordinates;

void main(){
    float depth = texture2D(u_texture, v_coordinates).r;
    gl_FragColor = vec4(1, 0, 0, 1.0);
}
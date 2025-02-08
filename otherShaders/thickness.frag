precision highp float;

uniform mat4 projectMatrix;

void main(){
    vec3 normal;
    normal.xy = gl_PointCoord.xy * vec2(2.0, -2.0) + vec2(-1.0,1.0);
    float mag = dot(normal.xy, normal.xy);
    if(mag > 1.0) discard;
    normal.z = sqrt(1.0 - mag);
    gl_FragColor = vec4(normal.z * 0.05, 0.0, 0.0, 0);
}
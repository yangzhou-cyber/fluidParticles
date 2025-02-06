precision highp float;

uniform sampler2D u_texture;
varying vec2 v_coordinates;
uniform mat4 u_invProjectMatrix;
uniform vec2 u_textureSize;
uniform mat4 u_thickness;




vec3 uvToEye(vec2 coord, float z){
    vec2 pos = coord * 2.0 - 1.0;
    vec4 clipPos = vec4(pos, z, 1.0);
    vec4 viewPos = u_invProjectMatrix * clipPos;
    return viewPos.xyz / viewPos.w;
}

void main(){
    float depth = texture2D(u_texture, v_coordinates).r;
    if(depth <= -1.0 || depth >= 1.0 || (depth*0.5f + 0.5f > backgroundDepth))
    {
        gl_fragColor = vec4(1,1,1,1);
        return;
    }
    vec2 depthTexelSize = 1.0 / u_textureSize;
    // calculate eye space position.
    vec3 eyeSpacePos = uvToEye(v_coordinates, depth);
    // finite difference.
    vec3 ddxLeft   = eyeSpacePos - uvToEye(v_coordinates - vec2(depthTexelSize.x,0.0),
    texture2D(u_texture, v_coordinates - vec2(depthTexelSize.x,0.0)).r);
    vec3 ddxRight  = uvToEye(v_coordinates + vec2(depthTexelSize.x,0.0),
    texture2D(u_texture, v_coordinates + vec2(depthTexelSize.x,0.0)).r) - eyeSpacePos;
    vec3 ddyTop    = uvToEye(v_coordinates + vec2(0.0,depthTexelSize.y),
    texture2D(u_texture, v_coordinates + vec2(0.0,depthTexelSize.y)).r) - eyeSpacePos;
    vec3 ddyBottom = eyeSpacePos - uvToEye(v_coordinates - vec2(0.0,depthTexelSize.y),
    texture2D(u_texture, v_coordinates - vec2(0.0,depthTexelSize.y)).r);
    vec3 dx = ddxLeft;
    vec3 dy = ddyTop;
    if(abs(ddxRight.z) < abs(ddxLeft.z))
    dx = ddxRight;
    if(abs(ddyBottom.z) < abs(ddyTop.z))
    dy = ddyBottom;
    vec3 normal = normalize(cross(dx, dy));
    gl_FragColor = vec4(normal, 1);
}
precision highp float;

uniform sampler2D u_texture;
uniform sampler2D u_thickness;
varying vec2 v_coordinates;
varying vec4 u_liquidColor;
uniform mat4 u_invProjectMatrix;
uniform mat4 u_invViewMatrix;
uniform mat4 u_viewMatrix;
uniform vec2 u_textureSize;



vec3 uvToEye(vec2 coord, float z){
    vec2 pos = coord * 2.0 - 1.0;
    vec4 clipPos = vec4(pos, z, 1.0);
    vec4 viewPos = u_invProjectMatrix * clipPos;
    return viewPos.xyz / viewPos.w;
}

void main(){
    float depth = texture2D(u_texture, v_coordinates).r;
    if(depth <= -1.0 || depth >= 1.0 )
    {
        gl_FragColor = vec4(1,1,1,1);
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
    vec3 worldPos = (u_invViewMatrix * vec4(eyeSpacePos, 1.0)).xyz;
    gl_FragColor = vec4(normal, 1);
    return;
    vec2 texScale = vec2(0.75, 1.0);		// ???.
    float refractScale = 1.33 * 0.025;	// index.
    refractScale *= smoothstep(0.1, 0.4, worldPos.y);
    vec2 refractCoord = v_coordinates + normal.xy * refractScale * texScale;
    float thickness = max(texture2D(u_thickness, v_coordinates).r, 0.3);
    vec3 transmission = exp(-(vec3(1.0) - u_liquidColor.xyz) * thickness);
    vec3 refractedColor = vec3(1,1,1) * transmission;

    // -----------------Phong lighting----------------------------
    vec3 viewDir = -normalize(eyeSpacePos);
    vec3 lightDir = normalize((u_viewMatrix * vec4(0, -1, 0, 0.0)).xyz);
    vec3 halfVec = normalize(viewDir + lightDir);
    vec3 specular = vec3(vec3(1,1,1) * pow(max(dot(halfVec, normal), 0.0), 400.0));
    vec3 diffuse = u_liquidColor.xyz * max(dot(lightDir, normal), 0.0) * vec3(0.5,0.5,0.5) * u_liquidColor.w;

    // -----------------Merge all effect----------------------------
    vec4 fragColor = vec4(diffuse + specular + refractedColor, 1);

    // gamma correction.
    // glow map.
    float brightness = dot(fragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    gl_FragColor = vec4(fragColor.rgb * brightness * brightness, 1.0);
}
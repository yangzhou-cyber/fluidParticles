precision highp float;

attribute vec2 a_textureCoordinates;

uniform mat4 u_projectionViewMatrix;

uniform sampler2D u_positionsTexture;
uniform float pointSize;
uniform float pointScale;
uniform mat4 viewMatrix;
varying vec3 eyeSpacePos;

void main () {
    vec3 spherePosition = texture2D(u_positionsTexture, a_textureCoordinates).rgb;
    eyeSpacePos = (viewMatrix * vec4(spherePosition, 1.0)).xyz;
    gl_PointSize = -pointScale * pointSize / eyeSpacePos.z;
    gl_Position = u_projectionViewMatrix * vec4(spherePosition, 1.0);
}
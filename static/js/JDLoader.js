window.THREE.JDLoader = function(a) {
  this.manager = void 0 !== a ? a: window.THREE.DefaultLoadingManager
},
window.THREE.JDLoader.prototype = {
  constructor: window.THREE.JDLoader,
  load: function(a, b, c, d) {
      var e = this,
      f = this.texturePath && "string" == typeof this.texturePath ? this.texturePath: window.THREE.Loader.prototype.extractUrlBase(a),
      g = new window.THREE.FileLoader(this.manager);
      g.load(a,
      function(a) {
          e.loadText(a, b, f)
      },
      c, d)
  },
  loadText: function(a, b, c) {
      var d = JSON.parse(a);
      if (d) {
          var e = this.parse(d, c);
          b(e)
      }
  },
  setTexturePath: function(a) {
      this.texturePath = a
  },
  parse: function(a, b) {
      function i() {
          var b, d, a = new window.THREE.Sphere,
          e = 0,
          f = 0,
          h = 0,
          i = [],
          j = [],
          l = new window.THREE.Vector3(0, 0, 0),
          m = new window.THREE.Vector3(0, 0, 0);
          if (g && g.length) {
              for (b = 0; b < g.length; ++b) g[b].boundingSphere || g[b].computeBoundingSphere(),
              f += g[b].boundingSphere.radius;
              if (f > 0) {
                  for (b = 0; b < g.length; ++b) d = g[b],
                  j.push(d.boundingSphere.radius),
                  i.push(d.boundingSphere.center),
                  m.copy(d.boundingSphere.center),
                  m.multiplyScalar(d.boundingSphere.radius / f),
                  l.add(m);
                  for (b = 0; b < g.length; ++b) {
                      var n = l.distanceTo(i[b]);
                      n >= e && (e = n, h = e + j[b])
                  }
                  a.center = l,
                  a.radius = h
              }
          }
          return a
      }
      function j(a) {
          if (a && a.skin && a.skin.skinBones.length && a.skin.skinWeights.length) return f;
          var b = [];
          b.push(f[0]);
          var c = f[a.node],
          d = {};
          return d.name = c.name,
          d.parent = 0,
          d.pos = [c.pos[0], c.pos[1], c.pos[2]],
          d.scl = [c.scl[0], c.scl[1], c.scl[2]],
          d.rotq = [c.rotq[0], c.rotq[1], c.rotq[2], c.rotq[3]],
          b.push(d),
          b
      }
      function k() {
          if (e = [], void 0 !== a.materials && 0 !== a.materials.length) {
              var c, f, g, h, i, j = 0,
              k = 0,
              l = !1;
              for (j = 0; j < a.materials.length; ++j) {
                  var m = a.materials[j];
                  if (g = new window.THREE.Color(16777215), h = new window.THREE.Color(1644825), m.diffuse && g.fromArray(m.diffuse), m.specular && h.fromArray(m.specular), i = void 0 !== m.glossiness ? m.glossiness: 40, c = void 0, m.maps) for (var n = 0; n < m.maps.length; ++n) if ("diffuse" == m.maps[n].type && "" != m.maps[n].file) {
                      var o = !1,
                      p = m.maps[n].file.substring(m.maps[n].file.lastIndexOf(".") + 1);
                      if (p = p.toLowerCase(), p = "jpg" == p ? "jpeg": p, void 0 !== m.maps[n].data && ("bmp" == p || "png" == p || "jpeg" == p || "gif" == p)) {
                          var q = "",
                          r = m.maps[n].data,
                          s = r.length;
                          for (k = 0; k < s; ++k) q += String.fromCharCode(r[k]);
                          var t = window.btoa(q),
                          t = "data:image/" + p + ";base64," + t;
                          c = new window.THREE.Texture;
                          var u = new Image;
                          c.image = u,
                          u.src = t,
                          u.onload = function(a) {
                              return function() {
                                  a.needsUpdate = !0
                              }
                          } (c),
                          o = !0
                      }
                      if (!o) {
                          var v = new window.THREE.TextureLoader;
                          v.setCrossOrigin(d.crossOrigin),
                          c = v.load(b + m.maps[n].file),
                          c.wrapS = c.wrapT = THREE.RepeatWrapping;
                      }
                      c && "jpeg" != p && (l = !0);
                      break
                  }
                  f = new window.THREE.MeshPhongMaterial({
                      color: g.getHex(),
                      specular:h.getHex(),
                      flatShading: window.THREE.SmoothShading,
                      skinning: !0
                  }),
                  c && (f.map = c),
                  void 0 !== m.opacity && (f.opacity = m.opacity, m.opacity < 1 && (f.transparent = !0)),
                  l && (f.transparent = !0),
                  e.push(f)
              }
          }
      }
      function l() {
          if (f = void 0 !== a.hierarchy ? a.hierarchy.nodes: a.nodes, Array.isArray(f) && f.length > 0) for (var b = 0; b < f.length; ++b) void 0 !== f[b].rot && (f[b].rotq = f[b].rot, f[b].rot = void 0);
          else f = []
      }
      function m(a) {
          var b = new window.THREE.Matrix4;
          if (!f || a < 0 || !f[a]) return b;
          for (var c = a; c >= 0; c = f[c].parent) {
              var d = f[c],
              e = new window.THREE.Vector3(d.pos[0], d.pos[1], d.pos[2]),
              g = new window.THREE.Vector3(d.scl[0], d.scl[1], d.scl[2]),
              h = new window.THREE.Quaternion(d.rotq[0], d.rotq[1], d.rotq[2], d.rotq[3]),
              i = (new window.THREE.Matrix4).compose(e, h, g);
              b.premultiply(i)
          }
          return b
      }
      function o(b) {
          var c = -1;
          if (!b || !a.materials) return 0;
          for (var d = 0; d < b.length; ++d) {
              var e = a.materials[b[d].materialIndex];
              if (e && e.maps) for (var f = 0; f < e.maps.length; ++f) if ("diffuse" == e.maps[f].type) if (c < 0) c = e.maps[f].uvsIndex;
              else if (c != e.maps[f].uvsIndex) return c
          }
          return c < 0 ? 0 : c
      }
      function p() {
          var b = a.model;
          if (b && b.meshes) for (var c, d, e, h, i, k, l, n, p, q, r, t, v, x, A, B, C, D, E, F, G, r, H, I, J, K, Q, R = 0; R < b.meshes.length; ++R) {
              if (A = 0, i = new window.THREE.BufferGeometry, k = b.meshes[R], void 0 == k) return;
              if (k.name && (i.name = k.name), n = k.verts, void 0 == n) return;
              if (q = k.vertElement, void 0 == q) return;
              if (B = k.face, C = q.vertIndices, D = q.normals, E = q.colors, F = q.uvs, G = k.skin, r = k.node, void 0 == r || !(r >= 0 && r < f.length)) return;
              if (H = f[r], !(H && H.pos && H.rotq && H.scl)) return;
              if (void 0 == B) return;
              if (I = B.vertElementIndices, J = B.groups, !I || !J) return;
              K = m(r),
              l = C.length;
              var S = new Float32Array(3 * l);
              for (p = 0; p < l; ++p) c = 3 * C[p],
              d = 3 * p,
              t = new window.THREE.Vector3(n[c], n[c + 1], n[c + 2]),
              t.applyMatrix4(K),
              S[d] = t.x,
              S[d + 1] = t.y,
              S[d + 2] = t.z;
              if (i.addAttribute("position", new window.THREE.BufferAttribute(S, 3)), void 0 !== D && D.length > 0) {
                  var T = (new window.THREE.Matrix3).getNormalMatrix(K),
                  U = new Float32Array(D);
                  for (c = 0; c + 2 < D.length; c += 3) v = new window.THREE.Vector3(D[c], D[c + 1], D[c + 2]),
                  v.applyMatrix3(T).normalize(),
                  U[c] = v.x,
                  U[c + 1] = v.y,
                  U[c + 2] = v.z;
                  i.addAttribute("normal", new window.THREE.BufferAttribute(U, 3))
              }
              if (void 0 !== F && F.length > 0) {
                  c = o(J),
                  c = c < F.length ? c: 0;
                  var x = new Float32Array(F[c]);
                  i.addAttribute("uv", new window.THREE.BufferAttribute(x, 2)),
                  F.length > 1 && (c = 0 == c ? 1 : 0, x = new Float32Array(F[c]), i.addAttribute("uv2", new window.THREE.BufferAttribute(x, 2)))
              }
              var V = new Uint32Array(I);
              if (i.setIndex(new window.THREE.BufferAttribute(V, 1)), i.groups = J, h = n.length / 3, !G && H.parent >= 0) for (G = k.skin = {},
              G.skinBones = [], G.skinWeights = [], p = 0; p < h; ++p) G.skinBones.push([r]),
              G.skinWeights.push([1]);
              var W = [],
              X = [];
              Q = 0;
              var Y, Z;
              if (G && G.skinBones && G.skinWeights && G.skinBones.length == G.skinWeights.length) for (p = 0; p < h; ++p) {
                  Y = new window.THREE.Vector4(0, 0, 0, 0),
                  Z = new window.THREE.Vector4(0, 0, 0, 0);
                  var $ = 0;
                  for (e = 0; e < 4; ++e) e < G.skinBones[p].length ? (Y.setComponent(e, G.skinBones[p][e]), Z.setComponent(e, G.skinWeights[p][e]), ++$) : (Y.setComponent(e, 0), Z.setComponent(e, 0));
                  for (; $ < G.skinWeights[p].length;) Z.addScalar(.25 * G.skinWeights[p][$]),
                  ++$;
                  W.push(Y),
                  X.push(Z)
              }
              if (W.length > 0 && X.length > 0) for (i.addAttribute("skinIndex", new window.THREE.Float32BufferAttribute(new Float32Array(4 * l), 4)), i.addAttribute("skinWeight", new window.THREE.Float32BufferAttribute(new Float32Array(4 * l), 4)), p = 0; p < l; ++p) c = C[p],
              Y = W[c],
              Z = X[c],
              i.attributes.skinIndex.setXYZW(p, Y.x, Y.y, Y.z, Y.w),
              i.attributes.skinWeight.setXYZW(p, Z.x, Z.y, Z.z, Z.w);
              var _ = j(k);
              _ && _.length > 0 && (i.bones = _),
              g.push(i)
          }
      }
      function q() {
          var b = a.animation;
          if (b && b.keyframeAnimations && 0 != b.keyframeAnimations.length) {
              var e, f, h, i, j, c = b.keyframeAnimations.concat(),
              d = [];
              for (e = 0; e < c.length; e++) f = r(c[e]),
              f && d.push(f);
              if (d.length > 0) for (e = 0; e < g.length; ++e) {
                  var k = !1;
                  if (g[e] instanceof window.THREE.Geometry ? k = g[e].skinIndices && g[e].skinIndices.length > 0 && g[e].skinWeights && g[e].skinWeights.length > 0 : g[e] instanceof window.THREE.BufferGeometry && (k = g[e].attributes.skinIndex && g[e].attributes.skinIndex.count > 0 && g[e].attributes.skinWeight && g[e].attributes.skinWeight.count > 0), k) g[e].animations = d;
                  else for (g[e].animations = [], h = 0; h < d.length; ++h) {
                      var l = [];
                      for (i = d[h].tracks.length - 1; i >= 0; --i) j = d[h].tracks[i].name,
                      j != ".bones[" + g[e].name + "].position" && j != ".bones[" + g[e].name + "].quaternion" && j != ".bones[" + g[e].name + "].scale" || l.push(d[h].tracks[i]);
                      l.length > 0 && g[e].animations.push(new window.THREE.AnimationClip(d[h].name, d[h].duration, l))
                  }
              }
          }
      }
      function r(a) {
          if (!a) return console.error("parseKeyFrameAnimation: no animation"),
          null;
          var b = a.fps || 30,
          c = !0,
          d = a.length || -1;
          "frames" == a.timeline && (c = !1, d /= b);
          for (var e = function(a, d, e, f) {
              if (e && Array.isArray(e.times) && Array.isArray(e.values)) {
                  var g = [],
                  h = [];
                  if (g = g.concat(e.times), h = h.concat(e.values), !c) for (var i = 0; i < g.length; ++i) g[i] /= b;
                  g && 0 != g.length && h && 0 != h.length && f.push(new a(d, g, h))
              }
          },
          g = [], h = a.name || "default", i = a.animNodes || [], j = 0; j < i.length; j++) {
              var k = i[j];
              if (k) {
                  var l = "";
                  void 0 !== k.nodeName ? l = k.nodeName: void 0 !== k.nodeIndex && (l = f[k.nodeIndex].name);
                  var m = ".bones[" + l + "]";
                  e(window.THREE.VectorKeyframeTrack, m + ".position", k.pos, g),
                  e(window.THREE.VectorKeyframeTrack, m + ".scale", k.scl, g),
                  e(window.THREE.QuaternionKeyframeTrack, m + ".quaternion", k.rot, g)
              }
          }
          if (0 === g.length) return null;
          var n = new window.THREE.AnimationClip(h, d, g);
          return n
      }
      var c = 0,
      d = this,
      e = [],
      f = [],
      g = [];
      for (k(), l(), p(), q(), c = 0; c < g.length; ++c) g[c].computeFaceNormals(),
      g[c].computeBoundingSphere();
      var h = i();
      return {
          geometries: g,
          materials: e,
          jd_materials: a.materials,
          boundingSphere: h
      }
  }
};
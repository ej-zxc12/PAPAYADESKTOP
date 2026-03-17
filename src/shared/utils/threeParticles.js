import * as THREE from 'three';

export class ParticleBackground {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    this.particles = [];
    this.lines = null;
    this.particleCount = 60;
    
    this.init();
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.camera.position.z = 50;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new THREE.Color();
    
    for (let i = 0; i < this.particleCount; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 50;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      this.particles.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05
        )
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.8,
      color: 0x7EB88A, // Green
      transparent: true,
      opacity: 0.6
    });

    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);

    // Line segments connecting close particles
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xF0C000, // Orange/Yellow
      transparent: true,
      opacity: 0.15
    });
    
    this.lineGeometry = new THREE.BufferGeometry();
    this.lines = new THREE.LineSegments(this.lineGeometry, lineMaterial);
    this.scene.add(this.lines);

    this.animate();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    this.requestFrame = requestAnimationFrame(this.animate.bind(this));
    
    const positions = this.points.geometry.attributes.position.array;
    const linePositions = [];

    for (let i = 0; i < this.particleCount; i++) {
      const p = this.particles[i];
      p.position.add(p.velocity);

      // Bounce off bounds
      if (Math.abs(p.position.x) > 50) p.velocity.x *= -1;
      if (Math.abs(p.position.y) > 50) p.velocity.y *= -1;
      if (Math.abs(p.position.z) > 25) p.velocity.z *= -1;

      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;

      // Check connections
      for (let j = i + 1; j < this.particleCount; j++) {
        const p2 = this.particles[j];
        const dist = p.position.distanceTo(p2.position);
        if (dist < 15) {
          linePositions.push(p.position.x, p.position.y, p.position.z);
          linePositions.push(p2.position.x, p2.position.y, p2.position.z);
        }
      }
    }

    this.points.geometry.attributes.position.needsUpdate = true;
    this.lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this.requestFrame);
    window.removeEventListener('resize', this.onResize);
    this.scene.clear();
    this.renderer.dispose();
    if (this.points) {
      this.points.geometry.dispose();
      this.points.material.dispose();
    }
    if (this.lineGeometry) this.lineGeometry.dispose();
  }
}

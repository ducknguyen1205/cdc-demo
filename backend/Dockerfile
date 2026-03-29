# Stage 1: Build with Maven (multi-arch: supports AMD64 + ARM64/Apple Silicon)
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
COPY pom.xml .
# Download dependencies first (layer caching)
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# Stage 2: Run with slim JRE (multi-arch)
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /build/target/cdc-demo-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

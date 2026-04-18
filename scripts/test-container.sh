#!/bin/bash

# 访客登记系统 - 容器镜像测试脚本
# 用于在 CNB 云原生开发环境中测试容器

set -e

# 镜像配置
IMAGE_NAME="${IMAGE_TAG:-docker.cnb.cool/xiongfeiwu/visitor-registration:latest}"
CONTAINER_NAME="visitor-app-test"
PORT="${PORT:-8080}"

echo "================================================"
echo "🐳 访客登记系统 - 容器测试"
echo "================================================"
echo ""

# 清理旧容器
cleanup() {
    echo "🧹 清理旧容器..."
    docker rm -f ${CONTAINER_NAME} 2>/dev/null || true
}

# 拉取最新镜像
pull_image() {
    echo "📥 拉取最新镜像: ${IMAGE_NAME}"
    docker pull ${IMAGE_NAME}
    echo ""
}

# 运行容器
run_container() {
    echo "🚀 启动容器..."
    docker run -d \
        -p ${PORT}:80 \
        --name ${CONTAINER_NAME} \
        ${IMAGE_NAME}
    
    echo ""
    echo "✅ 容器启动成功!"
    echo ""
}

# 显示容器状态
show_status() {
    echo "📊 容器状态:"
    docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.ID}}\t{{.Status}}\t{{.Ports}}"
    echo ""
}

# 健康检查
health_check() {
    echo "🏥 健康检查..."
    sleep 3
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT} | grep -q "200"; then
        echo "✅ 应用运行正常!"
    else
        echo "⚠️  应用可能还在启动中，请稍后访问"
    fi
    echo ""
}

# 显示访问信息
show_access_info() {
    echo "================================================"
    echo "🌐 访问信息"
    echo "================================================"
    echo ""
    echo "  本地访问: http://localhost:${PORT}"
    echo ""
    echo "  如果在 CNB 云原生开发环境中:"
    echo "  请点击右下角的端口转发，访问 8080 端口"
    echo ""
    echo "================================================"
    echo ""
    echo "📝 常用命令:"
    echo "  查看日志: docker logs -f ${CONTAINER_NAME}"
    echo "  停止容器: docker stop ${CONTAINER_NAME}"
    echo "  删除容器: docker rm -f ${CONTAINER_NAME}"
    echo ""
}

# 显示日志
show_logs() {
    echo "📜 容器日志 (最近 20 行):"
    echo "----------------------------------------"
    docker logs --tail 20 ${CONTAINER_NAME} 2>&1 || true
    echo "----------------------------------------"
    echo ""
}

# 主函数
main() {
    case "${1:-run}" in
        run)
            cleanup
            pull_image
            run_container
            show_status
            health_check
            show_access_info
            ;;
        stop)
            echo "🛑 停止容器..."
            docker stop ${CONTAINER_NAME} 2>/dev/null || echo "容器未运行"
            ;;
        logs)
            docker logs -f ${CONTAINER_NAME}
            ;;
        status)
            show_status
            show_logs
            ;;
        cleanup)
            cleanup
            echo "✅ 清理完成"
            ;;
        *)
            echo "用法: $0 [run|stop|logs|status|cleanup]"
            echo ""
            echo "  run     - 拉取并运行容器 (默认)"
            echo "  stop    - 停止容器"
            echo "  logs    - 查看实时日志"
            echo "  status  - 查看容器状态"
            echo "  cleanup - 清理容器"
            ;;
    esac
}

main "$@"
